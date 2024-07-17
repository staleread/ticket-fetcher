export default () => ({
  port: Number(process.env.PORT) || 5000,
  theaterApi: {
    domain: process.env.THEATER_API_DOMAIN || 'ctg-proxy-live.stageblocks.net',
    loginInfo: {
      sessionKey:
        process.env.THEATER_API_SESSION_KEY ||
        'f71a317a443211efa3150050569fac8400000000000000000000000000000000',
      sourceNumber: process.env.THEATER_API_SOURCE_NUMBER || '15686',
      modeOfSale: process.env.THEATER_API_MOS || '6',
    },
  },
});
