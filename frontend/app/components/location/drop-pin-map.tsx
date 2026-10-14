"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { Check } from "lucide-react";
import "leaflet/dist/leaflet.css";
import type { Pin, SightingLocation } from "./location";

type DropPinOnMapProps = {
  currentLocation?: SightingLocation;
  handleActionButton: (location?: SightingLocation) => void;
  pins?: Pin[];
};

function makePinIcon(color: string) {
  return L.divIcon({
    className: "",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -36],
    html: `
      <svg width="32" height="40" viewBox="0 0 24 30" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 18 12 18s12-9 12-18C24 5.4 18.6 0 12 0z" fill="${color}"/>
        <circle cx="12" cy="12" r="4.5" fill="white"/>
      </svg>`,
  });
}

function ClickHandler({
  onPick,
}: {
  onPick: (latlng: { latitude: number; longitude: number }) => void;
}) {
  useMapEvents({
    click(e) {
      onPick({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

function Recenter({ location }: { location?: SightingLocation }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.flyTo([location.lat, location.lng], 13);
  }, [location, map]);
  return null;
}

export default function DropPinOnMap({
  currentLocation,
  handleActionButton,
  pins,
}: DropPinOnMapProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [selected, setSelected] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const selectedIcon = useMemo(() => makePinIcon("#DC2626"), []);
  const pinIcon = useMemo(() => makePinIcon("#6750A4"), []);

  const center: [number, number] = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : [45, -100];
  const zoom = currentLocation ? 13 : 3;

  return (
    <div className="w-full overflow-hidden rounded-xl bg-[#F7F2FA] shadow-md">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="h-[550px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter location={currentLocation} />
        <ClickHandler
          onPick={(coords) => {
            setSelected(coords);
            setConfirmed(false);
          }}
        />

        {selected && (
          <Marker
            position={[selected.latitude, selected.longitude]}
            icon={selectedIcon}
          >
            <Popup>Selected Location</Popup>
          </Marker>
        )}

        {pins
          ?.filter((p) => p.latitude && p.longitude)
          .map((pin, i) => (
            <Marker
              key={i}
              position={[pin.latitude, pin.longitude]}
              icon={pinIcon}
            >
              <Popup>{pin.title}</Popup>
            </Marker>
          ))}
      </MapContainer>

      <div className="flex flex-col gap-2 px-4 py-3">
        <p className="text-xs text-[#666]" aria-live="polite">
          {selected
            ? "Pin placed! Click the button to confirm."
            : "Click the map to place a pin, or double-click to zoom."}
        </p>
        <button
          type="button"
          disabled={!selected || confirmed}
          onClick={() => {
            if (!selected) return;
            handleActionButton({ lat: selected.latitude, lng: selected.longitude });
            setConfirmed(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6750A4] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#5a4491] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6750A4] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#1D1B20]/12 disabled:text-[#1D1B20]/38"
        >
          {confirmed && <Check className="h-4 w-4" />}
          {confirmed ? "Location Confirmed" : "Confirm Location"}
        </button>
      </div>
    </div>
  );
}
