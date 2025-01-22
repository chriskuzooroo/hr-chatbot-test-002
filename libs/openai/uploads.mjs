import { FormData, File } from 'openai/_shims/form-data';
import { getMultipartRequestOptions } from 'openai/_shims/getMultipartRequestOptions';
import { fileFromPath } from 'openai/_shims/fileFromPath';
import { isFsReadStream } from 'openai/_shims/node-readable';
export { fileFromPath };
export const isResponseLike = (value) =>
  value != null &&
  typeof value === 'object' &&
  typeof value.url === 'string' &&
  typeof value.blob === 'function';
export const isFileLike = (value) =>
  value != null &&
  typeof value === 'object' &&
  typeof value.name === 'string' &&
  typeof value.lastModified === 'number' &&
  isBlobLike(value);
/**
 * The BlobLike type omits arrayBuffer() because @types/node-fetch@^2.6.4 lacks it; but this check
 * adds the arrayBuffer() method type because it is available and used at runtime
 */
export const isBlobLike = (value) =>
  value != null &&
  typeof value === 'object' &&
  typeof value.size === 'number' &&
  typeof value.type === 'string' &&
  typeof value.text === 'function' &&
  typeof value.slice === 'function' &&
  typeof value.arrayBuffer === 'function';
export const isUploadable = (value) => {
  return isFileLike(value) || isResponseLike(value) || isFsReadStream(value);
};
/**
 * Helper for creating a {@link File} to pass to an SDK upload method from a variety of different data formats
 * @param value the raw content of the file.  Can be an {@link Uploadable}, {@link BlobLikePart}, or {@link AsyncIterable} of {@link BlobLikePart}s
 * @param {string=} name the name of the file. If omitted, toFile will try to determine a file name from bits if possible
 * @param {Object=} options additional properties
 * @param {string=} options.type the MIME type of the content
 * @param {number=} options.lastModified the last modified timestamp
 * @returns a {@link File} with the given properties
 */
export async function toFile(value, name, options = {}) {
  var _a, _b, _c;
  // If it's a promise, resolve it.
  value = await value;
  if (isResponseLike(value)) {
    const blob = await value.blob();
    name ||
      (name =
        (_a = new URL(value.url).pathname.split(/[\\/]/).pop()) !== null && _a !== void 0 ?
          _a
        : 'unknown_file');
    return new File([blob], name, options);
  }
  const bits = await getBytes(value);
  name || (name = (_b = getName(value)) !== null && _b !== void 0 ? _b : 'unknown_file');
  if (!options.type) {
    const type = (_c = bits[0]) === null || _c === void 0 ? void 0 : _c.type;
    if (typeof type === 'string') {
      options = { ...options, type };
    }
  }
  return new File(bits, name, options);
}
async function getBytes(value) {
  var _a;
  let parts = [];
  if (
    typeof value === 'string' ||
    ArrayBuffer.isView(value) || // includes Uint8Array, Buffer, etc.
    value instanceof ArrayBuffer
  ) {
    parts.push(value);
  } else if (isBlobLike(value)) {
    parts.push(await value.arrayBuffer());
  } else if (
    isAsyncIterableIterator(value) // includes Readable, ReadableStream, etc.
  ) {
    for await (const chunk of value) {
      parts.push(chunk); // TODO, consider validating?
    }
  } else {
    throw new Error(
      `Unexpected data type: ${typeof value}; constructor: ${
        (_a = value === null || value === void 0 ? void 0 : value.constructor) === null || _a === void 0 ?
          void 0
        : _a.name
      }; props: ${propsForError(value)}`,
    );
  }
  return parts;
}
function propsForError(value) {
  const props = Object.getOwnPropertyNames(value);
  return `[${props.map((p) => `"${p}"`).join(', ')}]`;
}
function getName(value) {
  var _a;
  return (
    getStringFromMaybeBuffer(value.name) ||
    getStringFromMaybeBuffer(value.filename) ||
    // For fs.ReadStream
    ((_a = getStringFromMaybeBuffer(value.path)) === null || _a === void 0 ? void 0 : _a.split(/[\\/]/).pop())
  );
}
const getStringFromMaybeBuffer = (x) => {
  if (typeof x === 'string') return x;
  if (typeof Buffer !== 'undefined' && x instanceof Buffer) return String(x);
  return undefined;
};
const isAsyncIterableIterator = (value) =>
  value != null && typeof value === 'object' && typeof value[Symbol.asyncIterator] === 'function';
export class MultipartBody {
  constructor(body) {
    this.body = body;
  }
  get [Symbol.toStringTag]() {
    return 'MultipartBody';
  }
}
export const isMultipartBody = (body) =>
  body && typeof body === 'object' && body.body && body[Symbol.toStringTag] === 'MultipartBody';
/**
 * Returns a multipart/form-data request if any part of the given request body contains a File / Blob value.
 * Otherwise returns the request as is.
 */
export const maybeMultipartFormRequestOptions = async (opts) => {
  if (!hasUploadableValue(opts.body)) return opts;
  const form = await createForm(opts.body);
  return getMultipartRequestOptions(form, opts);
};
export const multipartFormRequestOptions = async (opts) => {
  const form = await createForm(opts.body);
  return getMultipartRequestOptions(form, opts);
};
export const createForm = async (body) => {
  const form = new FormData();
  await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value)));
  return form;
};
const hasUploadableValue = (value) => {
  if (isUploadable(value)) return true;
  if (Array.isArray(value)) return value.some(hasUploadableValue);
  if (value && typeof value === 'object') {
    for (const k in value) {
      if (hasUploadableValue(value[k])) return true;
    }
  }
  return false;
};
const addFormValue = async (form, key, value) => {
  if (value === undefined) return;
  if (value == null) {
    throw new TypeError(
      `Received null for "${key}"; to pass null in FormData, you must use the string 'null'`,
    );
  }
  // TODO: make nested formats configurable
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    form.append(key, String(value));
  } else if (isUploadable(value)) {
    const file = await toFile(value);
    form.append(key, file);
  } else if (Array.isArray(value)) {
    await Promise.all(value.map((entry) => addFormValue(form, key + '[]', entry)));
  } else if (typeof value === 'object') {
    await Promise.all(
      Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop)),
    );
  } else {
    throw new TypeError(
      `Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`,
    );
  }
};
//# sourceMappingURL=uploads.mjs.map
