## Requirements

You need to install docker in order to run this services.

## Build

You may start the application by typing `docker-compose up` in the path that contains `docker-compose.yml`.

## Drivers Endpoint

You may add drivers to cache from `localhost:3000/` by using prepared ui

Socket connection will be provided for each added driver.

By click `Start looking for driver` selected driver will start to send it's location info to redis cache and the driver will be included to distance calculation.

By clicking `Stop looking for rider` selected driver will stop sending it's location info to redis cache and the driver will no longer be included to distance calculations.

You may query near by drivers by get request to `localhost:3000/drivers?lat={latitude}&long={longitude}&m={radius in meters}`.

Example near by cabs request for querying drivers within 1 km respect to specified location.

```
GET /drivers?lat=40.925712&long=29.212257&m=1000 HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Cache-Control: no-cache

{
	"60550022-4109-4ae4-860d-3e7869026ef5": {
		"key": "60550022-4109-4ae4-860d-3e7869026ef5", // driver id
		"distance": 44.6782,
		"hash": 3508670780377909,
		"latitude": 40.926113515557994,
		"longitude": 29.21224147081375
	}
}
```
