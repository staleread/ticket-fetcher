export default () => ({
  port: Number(process.env.PORT),
  theaterApi: {
    domain: process.env.THEATER_API_DOMAIN,
    timeout: Number(process.env.THEATER_API_TIMEOUT),
    loginInfo: {
      sessionKey: process.env.THEATER_API_SESSION_KEY,
      sourceNumber: process.env.THEATER_API_SOURCE_NUMBER,
      modeOfSale: process.env.THEATER_API_MOS,
    },
  },
});
