import { z } from 'zod';

/**
 * SwitchBotのAPIからのHTTPレスポンススキーマ（bodyは含まれない）
 */
const baseSchema = z.object({
  /**
   * HTTPステータスコード
   */
  statusCode: z.number(),
  /**
   * メッセージ
   */
  message: z.string(),
});

/**
 * 温度計のステータスを表すスキーマ
 */
const meterStatus = {
  /**
   * デバイスID
   */
  deviceId: z.string(),
  /**
   * デバイスの種類
   */
  deviceType: z.string(),
  /**
   * 気温
   */
  temperature: z.number(),
};

/**
 * 温度計のステータスを示すレスポンスのスキーマ
 */
export const meterStatusResponse = baseSchema.extend({ body: z.object(meterStatus) });

/**
 * エアコンの設定を変更するコマンドのスキーマ
 */
const airConditionerCommand = z.object({
  /**
   * コマンドの種類
   */
  commandType: z.enum(['command']),
  /**
   * コマンドの内容
   */
  command: z.enum(['setAll']),
  /**
   * コマンドのパラメータ
   */
  parameter: z.string(),
});

/**
 * エアコンの設定を変更するコマンドのスキーマ
 */
export type AirConditionerCommand = z.infer<typeof airConditionerCommand>;

/**
 * エアコンの設定を変更するコマンドを実行したあとに、APIから返ってくるHTTPレスポンスのスキーマ
 */
export const controlCommandResponse = baseSchema;
