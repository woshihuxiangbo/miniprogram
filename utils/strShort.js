module.exports = {
  Compress: Compress,
  Decompress: Decompress
}

/**
 * 压缩 转62进制
 */
function Compress(longstr) {
  let arr = [],
    len = Math.ceil(longstr.length / 9);
  for (let i = 0; i < len; i++) {
    let numstr = longstr.slice(i * 9, (i + 1) * 9);
    numstr = getNum(numstr);
    arr.push(string10to62(numstr));
  }
  return arr.join('!');
}

/**
 * 解压缩
 */
function Decompress(stortr) {

  if (stortr && (stortr.indexOf('!')) >= 0) {
    let arr = stortr.split('!'),
      str = '';
    for (let i = 0; i < arr.length; i++) {
      str = str + getStr(string62to10(arr[i]));
    }
    return str;
  } else {
    return getStr(string62to10(stortr));
  }
}

/**整理首字母为0  例如 000 => @3 */
function getNum(str) {
  let len_1 = str.length;
  let len_2 = (((str + '1') * 1) + '').length - 1;
  let dl = len_1 - len_2;
  return `${dl ? ('@' + dl) : ""}${(str * 1) ? (str * 1) : ""}`;
}
/** 整理首字母为0  例如 @3 => 000*/
function getStr(str) {
  str += '';
  if (str.startsWith('@')) {
    let ast = str.slice(0, 2);
    let string = [];
    string.length = ast[1] * 1;
    string.fill('0');
    string = string.join('');
    str = str.replace(ast, string);
    return str;
  } else {
    return str;
  }
}


function string10to62(number) {
  let ast = '';
  if (number.startsWith('@')) {
    ast = number.slice(0, 2);
    number = number.replace(ast, '');
  }
  if (number == '') return ast;
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    radix = chars.length,
    qutient = +number,
    arr = [];
  do {
    let mod = qutient % radix;
    qutient = (qutient - mod) / radix;
    arr.unshift(chars[mod]);
  } while (qutient);
  return ast + arr.join('');
}

function string62to10(number_code) {
  let ast = '';
  if (number_code.startsWith('@')) {
    ast = number_code.slice(0, 2);
    number_code = number_code.replace(ast, '');
  }
  if (number_code == '') return ast;
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    radix = chars.length,
    number_code = String(number_code),
    len = number_code.length,
    i = 0,
    origin_number = 0;
  while (i < len) {
    origin_number += Math.pow(radix, i++) * chars.indexOf(number_code.charAt(len - i) || 0);
  }
  return ast + origin_number;
}