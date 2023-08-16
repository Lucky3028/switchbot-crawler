import { type ZodRawShape, z } from 'zod';

/**
 * SwitchBotのAPIからのHTTPレスポンススキーマ
 * @param bodyObject ボディのスキーマ
 * @returns HTTPレスポンススキーマ
 */
const generateResponseSchema = (bodyObject: ZodRawShape) =>
  z.object({
    /**
     * HTTPステータスコード
     */
    statusCode: z.number(),
    /**
     * メッセージ
     */
    message: z.string(),
    /**
     * ボディ
     */
    body: z.object(bodyObject),
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
export const meterStatusResponse = generateResponseSchema(meterStatus);

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
export const controlCommandResponse = generateResponseSchema({});
