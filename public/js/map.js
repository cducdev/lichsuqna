const map = L.map("map").setView([15.57284, 108.470978], 8);
var data = {};
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	maxZoom: 19,
	attribution: "© OpenStreetMap",
}).addTo(map);
// const polygon = L.polygon([

// ])

console.log(data);
