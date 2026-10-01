import type { Locale, SectionId } from '~/types/milestone';
import type { SensorMessage, SensorParseResult } from '~/types/sensor';
import { isPointInsideCanvas } from '~/data/installation-layout';
import { LOCALES, SECTION_IDS } from '~/types/milestone';
import { SENSOR_PROTOCOL_VERSION } from '~/types/sensor';

const MAX_POINTER_ID_LENGTH = 96;
const MAX_DETAIL_LENGTH = 240;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSectionId(value: unknown): value is SectionId {
  return typeof value === 'string' && SECTION_IDS.includes(value as SectionId);
}

function isShortString(value: unknown, maxLength = MAX_POINTER_ID_LENGTH): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
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

    if (value.detail !== undefined && !isShortString(value.detail, MAX_DETAIL_LENGTH))
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

  if (!isSectionId(value.section))
    return failure('invalid section');

  if (!isShortString(value.pointerId))
    return failure('invalid pointerId');

  if (value.type === 'touchEnd') {
    return {
      ok: true,
      message: { ...envelope, type: 'touchEnd', section: value.section, pointerId: value.pointerId },
    };
  }

  if (!Number.isFinite(value.x) || !Number.isFinite(value.y) || !isPointInsideCanvas(value.x as number, value.y as number))
    return failure('coordinates are outside the logical canvas');

  if (value.type === 'touchStart') {
    return {
      ok: true,
      message: {
        ...envelope,
        type: 'touchStart',
        section: value.section,
        target: 'artwork',
        pointerId: value.pointerId,
        x: value.x as number,
        y: value.y as number,
      },
    };
  }

  if (value.type === 'selectMilestone') {
    if (!isShortString(value.milestoneId))
      return failure('invalid milestoneId');

    return {
      ok: true,
      message: {
        ...envelope,
        type: 'selectMilestone',
        section: value.section,
        pointerId: value.pointerId,
        milestoneId: value.milestoneId,
        x: value.x as number,
        y: value.y as number,
      },
    };
  }

  if (value.type === 'selectLanguage') {
    if (typeof value.locale !== 'string' || !LOCALES.includes(value.locale as Locale))
      return failure('unsupported locale');

    return {
      ok: true,
      message: {
        ...envelope,
        type: 'selectLanguage',
        section: value.section,
        pointerId: value.pointerId,
        locale: value.locale as Locale,
        x: value.x as number,
        y: value.y as number,
      },
    };
  }

  return failure('unknown message type');
}
