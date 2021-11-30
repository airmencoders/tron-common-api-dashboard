export const STRING_LEN_MAX = 20;

/**
 * Attempts to shorten a string to max len of defined constant (STRING_LEN_MAX)
 * by leaving the extension (and its dot) intact and the first several characters and
 * replacing the rest with one (1) ellipsis
 * 
 * i.e. input string of 'startofverylongstringwithend.ext' would be 'startofver...d.ext'
 * 
 * @param str Input string to be shortened
 * @returns shortened version of the string
 */
export function shortenString(str: string | undefined | null): string {

  // return input if input is null or length zero (falsy)
  if (!str) return '';

  // if string is nothing but whitespace, return 0 length string
  if (/^\s+$/.test(str)) return '';

  // we're within bounds, return as-is
  if (str.length <= STRING_LEN_MAX) return str;
  
  // grab the extension and dot (if it exists)
  let charWithDotExt;
  if ((charWithDotExt = str.match(/.*(.\..+)$/)) != null && charWithDotExt[1]) {
    
    // check the char-with-dot-extension isn't itself over the char length limit (minus 5)
    //  to leave room for the ellipsis and at least the first char of the filename
    if (charWithDotExt[1].length < STRING_LEN_MAX-5) {
      return str.substr(0, (STRING_LEN_MAX - ('...' + charWithDotExt[1]).length) + 1) + ('...' + charWithDotExt[1]);
    }
    else {
      // chop off MAX_LEN plus padding from the end of the extension
      return str[0] + '...' + charWithDotExt[1].substr(0, STRING_LEN_MAX-4);
    }
  } else {
    // apparently no extension, just truncate to MAX LEN
    return str.substr(0, STRING_LEN_MAX);
  }
}