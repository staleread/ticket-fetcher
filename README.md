# ticket-fetcher

API to fetch available tickets for a specific performance you can find on
[website](https://www.centertheatregroup.org/booking/syos?perf_no=21920&facility_no=10).

## How to launch?

### Set environment variables

The app is expecting the following environment variables are defined:

- `PORT` (Default: 5000) - the port the app is listening on
- `THEATRE_API_DOMAIN` - the domain of the theatre API
- `THEATRE_API_TIMEOUT` - response timeout of API
- `THEATRE_API_SESSION_KEY`
- `THEATRE_API_SOURCE_NUMBER`
- `THEATRE_API_MOS` - the mode of sale

Those can be defined either by exporting them manually (in bash `export VARIABLE=VALUE`) or by creating the `.env` file in project directory. For the
latter option you may look at `.env.example` file with sample values.

### Run using Node

> [!IMPORTANT]
> Ensure Node.JS is installed on your system

Install required packages by running `npm install` or `npm i` for short.
Then run `npm start` to launch the app.

### Run as Docker container

> [!IMPORTANT]
> Ensure Docker is installed on your system and Docker daemon is running 

1. Get the image

```bash
# pull from Docker Hub
docker pull staleread/ticker-fetcher

# or build by yourself
docker build -t my-app:latest .
```

> [!WARNING]
> A building process involves multi-staging to decouple the build stages
> and make the size of resulting image as small as possible. This leads to
> dangling images (`<none>:<none>`) being generated. You can remove them
> by running `docker image prune -f`

2. Run the container

```bash
image=staleread/ticket-fetcher  # or your custom build name

docker run \
  -it \
  --expose 5000 \
  -p 80:5000 \
  --env-file .env \
  --name my-container
  $image
```
