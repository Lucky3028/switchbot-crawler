import type { Context, HonoRequest } from 'hono';
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

/**
 * HonoRequestからクエリ文字列を抜かしたURLを取得する
 * @param req Request
 * @returns クエリ文字列を抜かしたURL
 */
export const getUrl = (req: HonoRequest) => {
  const url = new URL(req.url);

  return `${url.origin}${url.pathname}`;
};

type HeaderRecord = Record<string, string | string[]>;

/**
 * Bodyが空の応答を生成する。
 * jsonTが必ずBodyに値を含めてしまって、Bodyが空でないといけないステータスコードのレスポンスができないので、それを解決するためのラッパー関数。
 * @param c Context
 * @param status ステータスコード
 * @param headers ヘッダ
 * @returns レスポンス
 */
export const emptyJsonT = (c: Context, status: 101 | 204 | 205 | 304, headers?: HeaderRecord) => ({
  ...c.jsonT({}),
  response: c.body(null, status, headers),
});
