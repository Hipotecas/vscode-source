import { CharCode } from './charCode'


export function startsWithIgnoreCase(str: string, candidate: string) {
  const candidateLength = candidate.length
  if (candidateLength > str.length) {
    return false
  }
  return compareSubstringIgnoreCase(str, candidate, 0, candidateLength) === 0
}


export function compareSubstringIgnoreCase(a: string, b: string, aStart: number = 0, aEnd: number = a.length, bStart: number = 0, bEnd: number = b.length) {

  for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
    let codeA = a.charCodeAt(aStart)
    let codeB = b.charCodeAt(bStart)

    if (codeA === codeB) {
      continue
    }

    if (codeA >= 128 || codeB >= 128) {
      return compareSubString(a.toLowerCase(), b.toLowerCase(), aStart, aEnd, bStart, bEnd)
    }

    if (isLowerAsciiLetter(codeA)) {
      codeA -= 32
    }
    if (isLowerAsciiLetter(codeB)) {
      codeB -= 32
    }

    const diff = codeA - codeB
    if (diff === 0) {
      continue
    }
    return diff
  }
  const aLen = aEnd - aStart
  const bLen = bEnd - bStart
  if (aLen < bLen) {
    return -1
  } else if (aLen > bLen) {
    return 1
  }
  return 0
}

function compareSubString(a: string, b: string, aStart: number = 0, aEnd: number = a.length, bStart: number = 0, bEnd: number = b.length) {
  for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
    const codeA = a.charCodeAt(aStart)
    const codeB = b.charCodeAt(bStart)
    if (codeA < codeB) {
      return -1
    } else if (codeA > codeB) {
      return 1
    }
  }

  const aLen = aEnd - aStart
  const bLen = bEnd - bStart
  if (aLen < bLen) {
    return -1
  } else if (aLen > bLen) {
    return 1
  }
  return 0
}

function isLowerAsciiLetter(code: number) {
  return code >= CharCode.a && code <= CharCode.z
}

export function isUpperAsciiLetter(code: number): boolean {
  return code >= CharCode.A && code <= CharCode.Z;
}
export function isAsciiDigit(code: number): boolean {
  return code >= CharCode.Digit0 && code <= CharCode.Digit9;
}

export function convertSimple2RegExpPattern(pattern: string): string {
  return pattern.replace(/[\-\\\{\}\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&').replace(/[\*]/g, '.*');
}

export function isEmojiImprecise(x: number): boolean {
  return (
    (x >= 0x1F1E6 && x <= 0x1F1FF) || (x === 8986) || (x === 8987) || (x === 9200)
    || (x === 9203) || (x >= 9728 && x <= 10175) || (x === 11088) || (x === 11093)
    || (x >= 127744 && x <= 128591) || (x >= 128640 && x <= 128764)
    || (x >= 128992 && x <= 129008) || (x >= 129280 && x <= 129535)
    || (x >= 129648 && x <= 129782)
  );
}
