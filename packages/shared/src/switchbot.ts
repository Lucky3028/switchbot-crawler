import { encode } from 'base64-arraybuffer';
import { type AirConditionerCommand, controlCommandResponse } from './schema/switchbot';

/**
 * SwitchBotのAPIのURL
 */
const url = 'https://api.switch-bot.com/v1.1/devices';

/**
 * 署名を生成する
 * @param token SwitchBotのトークン
 * @param secret SwitchBotにアクセスするためのシークレット値
 * @param now UNIX元期からの経過時間（ミリ秒）
 * @param nonce 何かしらの乱数データ
 * @returns 署名
 */
const generateSign = async (token: string, secret: string, now: number, nonce: string) => {
  const data = `${token}${now}${nonce}`;
  const secretKeyData = new TextEncoder().encode(secret);
  const key = await crypto.subtle.importKey('raw', secretKeyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signTerm = await crypto.subtle.sign('HMAC', key, Buffer.from(data, 'utf-8'));

  return encode(signTerm);
};

/**
 * SwitchBotへのアクセスに使用するAuthorizationヘッダを生成する
 * @param token SwitchBotのトークン
 * @param secret SwitchBotにアクセスするためのシークレット値
 * @returns Authorizationヘッダ
 */
const generateAuthorizationHeader = async (token: string, secret: string) => {
  const t = Date.now();
  const nonce = crypto.randomUUID();
  const sign = await generateSign(token, secret, t, nonce);

  return {
    Authorization: token,
    sign,
    nonce,
    t: t.toString(),
  };
};

/**
 * GETリクエストを実行する
 * @param token SwitchBotのトークン
 * @param secret SwitchBotにアクセスするためのシークレット値
 * @param path パス
 * @returns レスポンス
 */
const getRequest = async (token: string, secret: string, path?: string) => {
  const authHeader = await generateAuthorizationHeader(token, secret);
  const response = await fetch(`${url}/${path ?? ''}`, {
    method: 'GET',
    headers: { ...authHeader },
  });
  // TODO: error
  if (!response.ok) throw new Error('error');

  return response;
};

/**
 * POSTリクエストを実行する
 * @param token SwitchBotのトークン
 * @param secret SwitchBotにアクセスするためのシークレット値
 * @param path パス
 * @param data POSTするデータ
 * @returns レスポンス
 */
const postRequest = async (token: string, secret: string, path: string, data: unknown) => {
  const authHeader = await generateAuthorizationHeader(token, secret);
  const response = await fetch(`${url}/${path}`, {
    method: 'POST',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  // TODO: error
  if (!response.ok) throw new Error('error');

  return response;
};

/**
 * SwitchBotにアクセスするための関数をまとめたオブジェクトを作成する
 * @param token SwitchBotのトークン
 * @param secret SwitchBotにアクセスするためのシークレット値
 * @returns SwitchBotにアクセスするための関数をまとめたオブジェクト
 */
export const switchbot = (token: string, secret: string) =>
  ({
    getMeterStatus: async (deviceId: string) => {
      const path = `${deviceId}/status`;

      return getRequest(token, secret, path)
        .then(async (res) => res.json())
        .then((json) => controlCommandResponse.parse(json));
    },
    turnOnAirConditioner: async (deviceId: string, settingTemp: number) => {
      const path = `${deviceId}/commands`;
      const data: AirConditionerCommand = {
        commandType: 'command',
        command: 'setAll',
        // 運転モード: 1(自動)
        // 風量: 1(自動)
        parameter: `${settingTemp},1,1,on`,
      };

      return postRequest(token, secret, path, data)
        .then(async (res) => res.json())
        .then((json) => controlCommandResponse.parse(json));
    },
  }) as const;
