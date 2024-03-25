const form = document.getElementById("lobby-form");
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputVal = e.target?.["lobby-input"].value;
  window.location = `index.html?roomId=${inputVal}` as unknown as Location;
});
