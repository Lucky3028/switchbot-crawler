import { customAlphabet } from 'nanoid';
import { alphanumeric } from 'nanoid-dictionary';

/**
 * 文字列を10進数の整数にパースする
 * @param str 文字列
 * @returns 10進数の整数
 */
export const parseDecimalInt = (str: string) => parseInt(str, 10);

/**
 * 英数字からなるnanoidを生成する
 * @returns 英数字からなるnanoid。英字には大文字小文字いずれも含まれる
 */
export const nanoid = () => customAlphabet(alphanumeric, 20)();
