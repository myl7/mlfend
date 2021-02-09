let wasm

let cachedTextDecoder = new TextDecoder('utf-8', {ignoreBOM: true, fatal: true})

cachedTextDecoder.decode()

let cacheGetUint8Memory0 = null

function getUint8Memory0() {
  if (cacheGetUint8Memory0 === null || cacheGetUint8Memory0.buffer !== wasm.memory.buffer) {
    cacheGetUint8Memory0 = new Uint8Array(wasm.memory.buffer)
  }
  return cacheGetUint8Memory0
}

function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len))
}

const heap = new Array(32).fill(undefined)

heap.push(undefined, null, true, false)

let heap_next = heap.length

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1)
  const idx = heap_next
  heap_next = heap[idx]

  heap[idx] = obj
  return idx
}

function getObject(idx) {
  return heap[idx]
}

function dropObject(idx) {
  if (idx < 36) return
  heap[idx] = heap_next
  heap_next = idx
}

function takeObject(idx) {
  const ret = getObject(idx)
  dropObject(idx)
  return ret
}

let WASM_VECTOR_LEN = 0

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1)
  getUint8Memory0().set(arg, ptr / 1)
  WASM_VECTOR_LEN = arg.length
  return ptr
}

let cacheGetInt32Memory0 = null

function getInt32Memory0() {
  if (cacheGetInt32Memory0 === null || cacheGetInt32Memory0.buffer !== wasm.memory.buffer) {
    cacheGetInt32Memory0 = new Int32Array(wasm.memory.buffer)
  }
  return cacheGetInt32Memory0
}

function getArrayU8FromWasm0(ptr, len) {
  return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len)
}

/**
 * @param {Uint8Array} buf
 * @returns {Uint8Array}
 */
export function brotliDec(buf) {
  try {
    const retptr = wasm.__wbindgen_export_0.value - 16
    wasm.__wbindgen_export_0.value = retptr
    const ptr0 = passArray8ToWasm0(buf, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    wasm.brotliDec(retptr, ptr0, len0)
    const r0 = getInt32Memory0()[retptr / 4]
    const r1 = getInt32Memory0()[retptr / 4 + 1]
    const v1 = getArrayU8FromWasm0(r0, r1).slice()
    wasm.__wbindgen_free(r0, r1 * 1)
    return v1
  } finally {
    wasm.__wbindgen_export_0.value += 16
  }
}

async function load(module, imports) {
  if (typeof Response === 'function' && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === 'function') {
      try {
        return await WebAssembly.instantiateStreaming(module, imports)
      } catch (e) {
        if (module.headers.get('Content-Type') !== 'application/wasm') {
          console.warn('`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n', e)
        } else {
          throw e
        }
      }
    }

    const bytes = await module.arrayBuffer()
    return await WebAssembly.instantiate(bytes, imports)
  } else {
    const instance = await WebAssembly.instantiate(module, imports)

    if (instance instanceof WebAssembly.Instance) {
      return {instance, module}
    } else {
      return instance
    }
  }
}

async function init(input) {
  const imports = {}
  imports.wbg = {}
  imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1)
    return addHeapObject(ret)
  }
  imports.wbg.__wbindgen_rethrow = function (arg0) {
    throw takeObject(arg0)
  }

  if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
    input = fetch(input)
  }

  const {instance, module} = await load(await input, imports)

  wasm = instance.exports
  init.__wbindgen_wasm_module = module

  return wasm
}

export default init
