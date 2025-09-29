import { Player } from '../types';


/**
 * 選手名を表示する関数（同姓処理付き）
 * @param player 選手オブジェクト
 * @param allPlayers 全選手配列（同姓判定に使用）
 * @param useHiragana ひらがな表示するかどうか
 * @returns 表示用の名前
 */
export const getPlayerDisplayName = (player: Player, allPlayers: Player[] = [], useHiragana: boolean = true): string => {
  if (!useHiragana) {
    return player.name;
  }

  if (!player.hiraganaName) {
    return player.name;
  }

  // フルネーム形式（"さとう じろう"）か短縮形式（"じろう"）かを判定
  if (player.hiraganaName.includes(' ')) {
    // フルネーム形式の場合、同姓処理を行う
    const [familyNameHiragana, givenName] = player.hiraganaName.split(' ');
    const [familyNameKanji] = player.name.split(' ');
    
    // 同姓の選手を検索
    const sameFamilyPlayers = allPlayers.filter(p => 
      p.id !== player.id && 
      p.name && 
      p.name.split(' ')[0] === familyNameKanji &&
      p.hiraganaName &&
      p.hiraganaName.includes(' ')
    );
    
    if (sameFamilyPlayers.length > 0) {
      // 同姓の選手がいる場合：（さ）じろう形式で表示
      const firstChar = familyNameHiragana.charAt(0);
      return `（${firstChar}）${givenName}`;
    } else {
      // 同姓の選手がいない場合：ひらがな名のまま
      return player.hiraganaName;
    }
  } else {
    // 短縮形式の場合：そのまま表示
    return player.hiraganaName;
  }
};

/**
 * フルネームを取得する（マイページ用）
 * @param player 選手オブジェクト
 * @returns フルネーム
 */
export const getPlayerFullName = (player: Player): string => {
  return player.name;
};
