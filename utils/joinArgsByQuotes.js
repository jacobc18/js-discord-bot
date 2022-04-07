// Returns an array of args joined based on double quotes (")
// - ex: ['5/19/*', '"Happy', 'birthday', 'steve!"']
// - => ['5/19/*', 'Happy birthday steve!']
module.exports = (args, delimiter = ' ') => {
  if (!args || args.length === 0) return args;

  const toReturn = [];
  let toJoin = '';
  let joining = false;
  for (let i = 0; i < args.length; ++i) {
    const arg = args[i];
    if (arg.charAt(0) === '"') {
      toJoin = `${arg.substring(1)}${delimiter}`;
      joining = true;
    } else if (arg.charAt(arg.length - 1) === '"') {
      toReturn.push(`${toJoin}${arg.slice(0, -1)}`);
      joining = false;
      toJoin = '';
    } else if (joining && i === args.length - 1) {
      toReturn.push(`${toJoin}${arg}`);
    } else if (joining) {
      toJoin += `${arg}${delimiter}`;
    } else {
      toReturn.push(arg);
    }
  }

  return toReturn;
};
