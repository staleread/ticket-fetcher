export default () => ({
  port: Number(process.env.PORT),
  theatreApi: {
    domain: process.env.THEATRE_API_DOMAIN,
    timeout: Number(process.env.THEATRE_API_TIMEOUT),
    loginInfo: {
      sessionKey: process.env.THEATRE_API_SESSION_KEY,
      sourceNumber: process.env.THEATRE_API_SOURCE_NUMBER,
      modeOfSale: process.env.THEATRE_API_MOS,
    },
  },
});
