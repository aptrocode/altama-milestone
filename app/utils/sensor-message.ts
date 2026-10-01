import type { ColumnId, WallAction, WallLocale } from '../../shared/wall';
import type { SensorMessage, SensorParseResult } from '~/types/sensor';
import { getActionRects, isPointInsideCanvas, isPointInsideRect } from '~/data/installation-layout';
import { WALL_CONFIG } from '~/data/wall-config';
import { SENSOR_PROTOCOL_VERSION } from '~/types/sensor';
import { COLUMN_IDS, WALL_LOCALES } from '../../shared/wall';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isShortString(value: unknown, maxLength = 96): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

function parseAction(value: unknown): WallAction | null {
  if (!isRecord(value) || !COLUMN_IDS.includes(value.columnId as ColumnId))
    return null;
  const columnId = value.columnId as ColumnId;
  switch (value.type) {
    case 'main':
    case 'back':
    case 'previous':
    case 'next':
      return { type: value.type, columnId };
    case 'language':
      return WALL_LOCALES.includes(value.locale as WallLocale)
        ? { type: 'language', columnId, locale: value.locale as WallLocale }
        : null;
    case 'subItem':
      return WALL_CONFIG.columns.find(column => column.id === columnId)?.subItems?.some(sub => sub.key === value.subItemId)
        ? { type: 'subItem', columnId, subItemId: value.subItemId as string }
        : null;
    default:
      return null;
  }
}

function failure(error: string): SensorParseResult {
  return { ok: false, error };
}

export function parseSensorMessage(raw: string): SensorParseResult {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  }
  catch {
    return failure('message is not valid JSON');
  }

  if (!isRecord(value))
    return failure('message must be an object');
  if (value.version !== SENSOR_PROTOCOL_VERSION)
    return failure('unsupported protocol version');
  if (!isShortString(value.sessionId))
    return failure('invalid sessionId');
  if (!Number.isSafeInteger(value.seq) || (value.seq as number) < 0)
    return failure('invalid sequence number');
  if (!isShortString(value.layoutVersion))
    return failure('invalid layoutVersion');

  const envelope = {
    version: SENSOR_PROTOCOL_VERSION,
    sessionId: value.sessionId,
    seq: value.seq as number,
    layoutVersion: value.layoutVersion,
  };

  if (value.type === 'hello' || value.type === 'status') {
    if (typeof value.sensorReady !== 'boolean' || typeof value.calibrated !== 'boolean')
      return failure('invalid sensor status');
    if (value.detail !== undefined && !isShortString(value.detail, 240))
      return failure('invalid status detail');
    return {
      ok: true,
      message: {
        ...envelope,
        type: value.type,
        sensorReady: value.sensorReady,
        calibrated: value.calibrated,
        ...(value.type === 'status' && typeof value.detail === 'string' ? { detail: value.detail } : {}),
      } as SensorMessage,
    };
  }
  if (value.type === 'heartbeat')
    return { ok: true, message: { ...envelope, type: 'heartbeat' } };
  if (value.type !== 'input')
    return failure('unknown message type');

  const action = parseAction(value.action);
  if (!action)
    return failure('invalid wall action');
  if (!isShortString(value.pointerId))
    return failure('invalid pointerId');
  if (!Number.isFinite(value.x) || !Number.isFinite(value.y) || !isPointInsideCanvas(value.x as number, value.y as number))
    return failure('coordinates are outside the logical canvas');
  const x = value.x as number;
  const y = value.y as number;
  if (!getActionRects(action).some(rect => isPointInsideRect(x, y, rect)))
    return failure('coordinates do not match the declared target');

  return { ok: true, message: { ...envelope, type: 'input', action, pointerId: value.pointerId, x, y } };
}
