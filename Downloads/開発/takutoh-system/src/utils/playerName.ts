import { Player } from '../types';

/**
 * 選手名を表示する関数
 * @param player 選手オブジェクト
 * @param useHiragana ひらがな表示するかどうか
 * @returns 表示用の名前
 */
export const getPlayerDisplayName = (player: Player, useHiragana: boolean = true): string => {
  if (useHiragana && player.hiraganaName) {
    return player.hiraganaName;
  }
  return player.name;
};

/**
 * フルネームを取得する（マイページ用）
 * @param player 選手オブジェクト
 * @returns フルネーム
 */
export const getPlayerFullName = (player: Player): string => {
  return player.name;
};
