module.exports = {
  networks: {
    development: {
     host: "127.0.0.1",
     port: 7545, // Ganache GUI
     network_id: "*",
    },
  },

  // using version 0.6.6
  compilers: {
    solc: {
       version: "0.6.6",
       optimizer: {
         enabled: true,
         runs: 200
       },
    }
  }
}
