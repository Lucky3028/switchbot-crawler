export type Trigger = {
  hour: number;
  temp: number;
};

/**
 * 現在時刻を過ぎたトリガーをすべて返す。時刻が等しいものは気温がより低い方を含む。
 * @param source 元となるトリガーの配列
 * @param nowHour 現在時刻（時）
 * @returns 現在時刻を過ぎたトリガーの配列
 */
export const filterValidTrigger = (source: readonly Trigger[], nowHour: number) => {
  // TODO: #toSortedを使いたいが未実装のようなので、破壊的メソッドである#sortを使うため、スプレッド構文で別の配列を作成
  const copiedSource = [...source];
  // 時刻が同じならば気温の高い方を先に並べ、そうでなければ時刻が早い方を先に並べる
  copiedSource.sort((a, b) => (a.hour === b.hour ? b.temp - a.temp : a.hour - b.hour));
  // 時刻が等しい組を排除する。すでに時刻でソートしてあるので、後に並んでいる気温の低い方の組だけが残る
  // See: https://qiita.com/allJokin/items/28cd023335641e8796c5#map%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E9%87%8D%E8%A4%87%E3%82%92%E5%89%8A%E9%99%A4%E3%81%99%E3%82%8B
  const pairs = Array.from(new Map(copiedSource.map((pair) => [pair.hour, pair])).values());

  // 現在時刻が基準時間を超えているものだけを抽出
  return pairs.filter((pair) => nowHour >= pair.hour);
};
