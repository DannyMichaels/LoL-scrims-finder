const sendScrimTransaction = async (io, scrim) => {
  console.log('sendScrimTransaction');
  
  // Emit to all clients about scrim transaction update
  io.emit('getScrimTransaction', scrim);

  return;
};

module.exports = { sendScrimTransaction };