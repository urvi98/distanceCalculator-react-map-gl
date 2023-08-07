import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactMapGL, { Marker, Source, Layer } from "react-map-gl";
import { addPoint, resetPoints } from "../redux/reducers";
import { getDistance } from "geolib";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";

function Map() {
  const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
  const initialViewport = {
    latitude: 12.91654,
    longitude: 77.651947,
    zoom: 13,
  };

  const points = useSelector((state) => state.points);
  const dispatch = useDispatch();

  const [viewport, setViewport] = useState(initialViewport);

  const handlePointClick = (point) => {
    dispatch(addPoint(point));
  };

  const handleMapClick = (event) => {
    const clickedPoint = {
      lat: event.lngLat.lat,
      lng: event.lngLat.lng,
    };

    handlePointClick(clickedPoint);
  };

  const totalDistance = points.reduce((total, point, index) => {
    if (index === 0) {
      return total;
    }

    const previousPoint = points[index - 1];
    const distance = getDistance(
      { latitude: previousPoint.lat, longitude: previousPoint.lng },
      { latitude: point.lat, longitude: point.lng }
    );

    return total + distance;
  }, 0);

  const handleReset = () => {
    dispatch(resetPoints());
  };

  return (
    <div style={{ height: "80vh", width: "80%" }}>
      <ReactMapGL
        {...viewport}
        width="100%"
        height="100%"
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onViewportChange={(viewport) => setViewport(viewport)}
        onClick={handleMapClick}
      >
        <Source
          id="points"
          type="geojson"
          data={{
            type: "FeatureCollection",
            features: points.map((position, idx) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [position.lng, position.lat],
              },
              properties: {
                id: idx,
              },
            })),
          }}
        >
          <Layer
            id="point-layer"
            type="circle"
            source="points"
            paint={{
              "circle-radius": 8,
              "circle-color": "#1978c8",
            }}
          />
        </Source>
        {points.map((position, idx, array) => {
          if (idx === 0) {
            return null;
          }

          const previousPosition = array[idx - 1];
          const distance = getDistance(
            { latitude: previousPosition.lat, longitude: previousPosition.lng },
            { latitude: position.lat, longitude: position.lng }
          );

          const lineCoordinates = [
            [previousPosition.lng, previousPosition.lat],
            [position.lng, position.lat],
          ];

          const midpoint = [
            (lineCoordinates[0][0] + lineCoordinates[1][0]) / 2,
            (lineCoordinates[0][1] + lineCoordinates[1][1]) / 2,
          ];

          return (
            <div key={`marker-group-${idx}`}>
              <Source
                key={`line-${idx}`}
                id={`line-source-${idx}`}
                type="geojson"
                data={{
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: lineCoordinates,
                  },
                }}
              >
                <Layer
                  id={`line-layer-${idx}`}
                  type="line"
                  source={`line-source-${idx}`}
                  paint={{
                    "line-color": "blue",
                    "line-width": 2,
                  }}
                />
              </Source>
              <Marker
                key={`marker-${idx}-position`}
                latitude={position.lat}
                longitude={position.lng}
                offsetLeft={-20}
                offsetTop={-40}
              >
                <img
                  src="https://icon-library.com/images/pin-icon-png/pin-icon-png-16.jpg"
                  alt="Location Icon"
                  width={25}
                  height={30}
                />
              </Marker>
              <Marker
                key={`marker-${idx}-distance`}
                latitude={midpoint[1]}
                longitude={midpoint[0]}
                offsetLeft={-20}
                offsetTop={-20}
              >
                <div className="distance-label">
                  <div className="distance-label-text">{distance} meters</div>
                </div>
              </Marker>
            </div>
          );
        })}
      </ReactMapGL>
      <div>Total distance: {totalDistance} meters</div>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}

export default Map;
