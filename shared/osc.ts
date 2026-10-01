import type { ColumnId, ColumnSnapshot, WallAction, WallLocale } from './wall';
import { COLUMN_IDS } from './wall';

export type OscArgument = number | string | boolean | Uint8Array;

export interface OscMessage {
  address: string;
  types: string;
  args: OscArgument[];
}

function readOscString(buffer: Uint8Array, offset: number): [string, number] {
  let end = offset;
  while (end < buffer.length && buffer[end] !== 0) {
    end++;
  }
  const str = new TextDecoder().decode(buffer.subarray(offset, end));
  let next = end + 1;
  while (next % 4 !== 0) {
    next++;
  }
  return [str, next];
}

function writeOscString(str: string): Uint8Array {
  const encoded = new TextEncoder().encode(str);
  const len = encoded.length + 1;
  const paddedLen = Math.ceil(len / 4) * 4;
  const buf = new Uint8Array(paddedLen);
  buf.set(encoded, 0);
  return buf;
}

export function parseOscPacket(buffer: Uint8Array): OscMessage[] {
  if (buffer.length < 4)
    return [];

  const firstChar = String.fromCharCode(buffer[0]!);
  if (firstChar === '#') {
    const [header, headerNext] = readOscString(buffer, 0);
    if (header === '#bundle') {
      let offset = headerNext + 8; // skip 8-byte timetag
      const messages: OscMessage[] = [];
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

      while (offset + 4 <= buffer.length) {
        const elementSize = view.getInt32(offset, false);
        offset += 4;
        if (elementSize <= 0 || offset + elementSize > buffer.length)
          break;
        const elementBuffer = buffer.subarray(offset, offset + elementSize);
        messages.push(...parseOscPacket(elementBuffer));
        offset += elementSize;
      }
      return messages;
    }
  }

  const [address, addressNext] = readOscString(buffer, 0);
  if (!address.startsWith('/'))
    return [];

  let offset = addressNext;
  let typeTag = '';
  if (offset < buffer.length && buffer[offset] === 44) { // ',' = 44
    const [parsedTypeTag, typeTagNext] = readOscString(buffer, offset);
    typeTag = parsedTypeTag;
    offset = typeTagNext;
  }

  const args: OscArgument[] = [];
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  for (let i = 1; i < typeTag.length; i++) {
    const tag = typeTag[i]!;
    if (tag === 'i') {
      if (offset + 4 > buffer.length)
        break;
      args.push(view.getInt32(offset, false));
      offset += 4;
    }
    else if (tag === 'f') {
      if (offset + 4 > buffer.length)
        break;
      args.push(view.getFloat32(offset, false));
      offset += 4;
    }
    else if (tag === 's') {
      const [str, next] = readOscString(buffer, offset);
      args.push(str);
      offset = next;
    }
    else if (tag === 'T') {
      args.push(true);
    }
    else if (tag === 'F') {
      args.push(false);
    }
    else if (tag === 'b') {
      if (offset + 4 > buffer.length)
        break;
      const blobLength = view.getInt32(offset, false);
      offset += 4;
      const blobPadded = Math.ceil(blobLength / 4) * 4;
      args.push(buffer.subarray(offset, offset + blobLength));
      offset += blobPadded;
    }
  }

  return [{ address, types: typeTag, args }];
}

export function createOscMessage(address: string, args: (number | string | boolean)[] = []): Uint8Array {
  const addrBytes = writeOscString(address);
  let typeTag = ',';
  const argByteList: Uint8Array[] = [];

  for (const arg of args) {
    if (typeof arg === 'boolean') {
      typeTag += arg ? 'T' : 'F';
    }
    else if (typeof arg === 'number') {
      if (Number.isInteger(arg)) {
        typeTag += 'i';
        const b = new Uint8Array(4);
        new DataView(b.buffer).setInt32(0, arg, false);
        argByteList.push(b);
      }
      else {
        typeTag += 'f';
        const b = new Uint8Array(4);
        new DataView(b.buffer).setFloat32(0, arg, false);
        argByteList.push(b);
      }
    }
    else if (typeof arg === 'string') {
      typeTag += 's';
      argByteList.push(writeOscString(arg));
    }
  }

  const typeBytes = writeOscString(typeTag);
  const totalLength = addrBytes.length + typeBytes.length + argByteList.reduce((sum, b) => sum + b.length, 0);
  const out = new Uint8Array(totalLength);
  let pos = 0;
  out.set(addrBytes, pos);
  pos += addrBytes.length;
  out.set(typeBytes, pos);
  pos += typeBytes.length;
  for (const b of argByteList) {
    out.set(b, pos);
    pos += b.length;
  }
  return out;
}

function parseLocale(input: string): WallLocale | null {
  const lower = input.toLowerCase();
  if (lower === 'id' || lower === 'indonesia' || lower === 'indonesian')
    return 'id';
  if (lower === 'en' || lower === 'english')
    return 'en';
  if (lower === 'zh' || lower === 'zh-hans' || lower === 'chinese' || lower === 'mandarin')
    return 'zh-Hans';
  return null;
}

export function oscToWallActions(
  message: OscMessage,
  currentColumns?: Record<ColumnId, ColumnSnapshot>,
): WallAction[] {
  const address = message.address.trim();
  const args = message.args;

  // /altama/reset
  if (address === '/altama/reset') {
    if (currentColumns) {
      return (Object.keys(currentColumns) as unknown as ColumnId[])
        .map(id => Number.parseInt(String(id), 10) as ColumnId)
        .filter(id => currentColumns[id]?.phase !== 'idle')
        .map(id => ({ type: 'back', columnId: id }));
    }
    return COLUMN_IDS.map(id => ({ type: 'back', columnId: id }));
  }

  // /altama/column or /altama/col/[1-6]
  const colMatch = address.match(/^\/altama\/col(?:umn)?\/([1-6])$/i);
  if (colMatch) {
    const columnId = Number.parseInt(colMatch[1]!, 10) as ColumnId;
    const isIdle = !currentColumns || currentColumns[columnId]?.phase === 'idle';
    return [{ type: isIdle ? 'main' : 'back', columnId }];
  }

  if (address === '/altama/column' || address === '/altama/col') {
    const rawId = typeof args[0] === 'number' ? args[0] : Number.parseInt(String(args[0]), 10);
    if (COLUMN_IDS.includes(rawId as ColumnId)) {
      const columnId = rawId as ColumnId;
      const isIdle = !currentColumns || currentColumns[columnId]?.phase === 'idle';
      return [{ type: isIdle ? 'main' : 'back', columnId }];
    }
  }

  // /altama/open [1-6]
  if (address === '/altama/open') {
    const rawId = typeof args[0] === 'number' ? args[0] : Number.parseInt(String(args[0]), 10);
    if (COLUMN_IDS.includes(rawId as ColumnId))
      return [{ type: 'main', columnId: rawId as ColumnId }];
  }

  // /altama/back [1-6?]
  if (address === '/altama/back') {
    if (args.length > 0) {
      const rawId = typeof args[0] === 'number' ? args[0] : Number.parseInt(String(args[0]), 10);
      if (COLUMN_IDS.includes(rawId as ColumnId))
        return [{ type: 'back', columnId: rawId as ColumnId }];
    }
    if (currentColumns) {
      return (Object.keys(currentColumns) as unknown as ColumnId[])
        .map(id => Number.parseInt(String(id), 10) as ColumnId)
        .filter(id => currentColumns[id]?.phase !== 'idle')
        .map(id => ({ type: 'back', columnId: id }));
    }
    return COLUMN_IDS.map(id => ({ type: 'back', columnId: id }));
  }

  // /altama/next [1-6]
  if (address === '/altama/next') {
    const rawId = typeof args[0] === 'number' ? args[0] : Number.parseInt(String(args[0]), 10);
    if (COLUMN_IDS.includes(rawId as ColumnId))
      return [{ type: 'next', columnId: rawId as ColumnId }];
  }

  // /altama/prev or /altama/previous [1-6]
  if (address === '/altama/prev' || address === '/altama/previous') {
    const rawId = typeof args[0] === 'number' ? args[0] : Number.parseInt(String(args[0]), 10);
    if (COLUMN_IDS.includes(rawId as ColumnId))
      return [{ type: 'previous', columnId: rawId as ColumnId }];
  }

  // /altama/subItem [1-6] [subItemId]
  if (address === '/altama/subItem' || address === '/altama/subitem') {
    const rawId = typeof args[0] === 'number' ? args[0] : Number.parseInt(String(args[0]), 10);
    const subItemId = String(args[1] || '').trim();
    if (COLUMN_IDS.includes(rawId as ColumnId) && subItemId)
      return [{ type: 'subItem', columnId: rawId as ColumnId, subItemId }];
  }

  // /altama/lang [locale] or [1-6] [locale]
  if (address === '/altama/lang' || address === '/altama/locale' || address === '/altama/language') {
    if (args.length === 1 && typeof args[0] === 'string') {
      const locale = parseLocale(args[0]);
      if (locale)
        return COLUMN_IDS.map(id => ({ type: 'language', columnId: id, locale }));
    }
    else if (args.length >= 2) {
      const rawId = typeof args[0] === 'number' ? args[0] : Number.parseInt(String(args[0]), 10);
      const locale = parseLocale(String(args[1]));
      if (COLUMN_IDS.includes(rawId as ColumnId) && locale)
        return [{ type: 'language', columnId: rawId as ColumnId, locale }];
    }
  }

  return [];
}
