document.addEventListener("DOMContentLoaded", () => {
  // 1. 사용할 요소들 가져오기
  const cityInput = document.getElementById("city-input");
  const searchBtn = document.getElementById("search-btn");

  const cityName = document.getElementById("city-name");
  const weatherCondition = document.getElementById("weather-condition");
  const temperature = document.getElementById("temperature");
  const humidity = document.getElementById("humidity");
  const windSpeed = document.getElementById("wind-speed");
  const weatherTip = document.getElementById("weather-tip");

  // 2. 발급받은 API 키
  const API_KEY = "발급받은 API키를 입력하세요.";

  // 3. 날씨 배경 변경 함수
  function changeBackground(weatherMain) {
    let bgImage = "weather-bg.png"; // 기본 배경
    const condition = weatherMain ? weatherMain.toLowerCase() : "";

    if (condition === "clear") {
      bgImage = "clear.png";
    } else if (
      condition === "clouds" ||
      condition === "mist" ||
      condition === "haze" ||
      condition === "fog"
    ) {
      bgImage = "clouds.jpg";
    } else if (
      condition === "rain" ||
      condition === "drizzle" ||
      condition === "thunderstorm"
    ) {
      bgImage = "rain.png";
    } else if (condition === "snow") {
      bgImage = "snow.png";
    } else {
      bgImage = "weather-bg.png";
    }

    // 💡 이미지 적용 및 배경 속성 강제 지정
    document.body.style.backgroundImage = `url("image/${bgImage}")`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
  }

  // 4. 옷차림 추천 함수
  function getClothingRecommendation(feelsLike, humidity, windSpeed, weatherMain) {
    const condition = weatherMain ? weatherMain.toLowerCase() : "";

    if (condition === "snow") {
      return "눈이 내려요! 길이 미끄러우니 조심하시고 따뜻하게 입으세요. ❄️";
    }
    if (
      condition === "rain" ||
      condition === "drizzle" ||
      condition === "thunderstorm"
    ) {
      return "비가 내리고 있어요. 잊지 말고 우산을 꼭 챙기세요! ☔";
    }

    let recommendation = "";

    if (feelsLike <= 4) {
      recommendation = "패딩이나 두꺼운 코트를 입고 목도리, 장갑을 챙기세요. 🥶";
    } else if (feelsLike <= 8) {
      recommendation = "울 코트나 가죽 재킷, 히트텍을 추천해요. 쌀쌀합니다!";
    } else if (feelsLike <= 11) {
      recommendation = "트렌치코트나 도톰한 야상을 입기 좋은 날씨예요.";
    } else if (feelsLike <= 16) {
      recommendation = "자켓, 가디건, 셔츠를 여러 겹 챙겨 입으세요.";
    } else if (feelsLike <= 19) {
      recommendation = "쌀쌀할 수 있으니 얇은 겉옷이나 니트를 챙기세요. 🧥";
    } else if (feelsLike <= 22) {
      recommendation = "긴소매 티셔츠나 얇은 가디건을 가볍게 걸치기 좋아요.";
    } else if (feelsLike <= 27) {
      recommendation = "반팔이나 얇은 셔츠 등 가벼운 옷차림이 알맞아요.";
    } else {
      recommendation = "한여름 무더위예요! 통풍이 잘되는 시원한 옷을 입고 수분을 보충하세요. ☀️";
    }

    if (windSpeed >= 5.0 && feelsLike <= 15) {
      recommendation += " (바람이 강해 더 춥게 느껴지니 바람막이를 챙기세요!)";
    } else if (humidity >= 70 && feelsLike >= 24) {
      recommendation += " (습도가 높아 후텁지근하니 통기성이 좋은 린넨 소재를 추천해요.)";
    }

    return recommendation;
  }

  // 5. 날씨 데이터를 화면에 렌더링하는 공통 함수
  function updateWeatherUI(data) {
    let desc = data.weather[0].description;
    if (desc === "온흐림") {
      desc = "흐림";
    }

    cityName.textContent = data.name;
    weatherCondition.textContent = desc;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;

    const feelsLikeTemp = Math.round(data.main.feels_like);
    if (weatherTip) {
      weatherTip.textContent = getClothingRecommendation(
        feelsLikeTemp,
        data.main.humidity,
        data.wind.speed,
        data.weather[0].main
      );
    }

    changeBackground(data.weather[0].main);
  }

  // 6-A. 도시 이름으로 날씨 조회
  async function getWeather(city) {
    if (!city) {
      alert("도시 이름을 입력해 주세요!");
      return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=kr`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.cod !== 200) {
        alert(`오류: ${data.message}`);
        return;
      }

      updateWeatherUI(data);
    } catch (error) {
      console.error("날씨 정보 로딩 실패:", error);
      alert("날씨 정보를 가져오지 못했습니다.");
    }
  }

  // 6-B. GPS 위도/경도로 날씨 조회
  async function getWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.cod !== 200) {
        getWeather("Seoul");
        return;
      }

      updateWeatherUI(data);
    } catch (error) {
      console.error("GPS 위치 날씨 조회 실패:", error);
      getWeather("Seoul"); // 실패 시 기본값 서울
    }
  }

  // 7. 접속 시 GPS 위치 자동 요청 함수
  function loadCurrentLocationWeather() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          getWeatherByCoords(lat, lon);
        },
        (error) => {
          console.warn("위치 정보 접근이 거부되었거나 실패하여 기본값(Seoul)을 불러옵니다:", error.message);
          getWeather("Seoul");
        },
        { timeout: 8000 } // 8초 동안 응답 없으면 기본값으로
      );
    } else {
      getWeather("Seoul");
    }
  }

  // 8. 검색 이벤트 리스너
  if (searchBtn && cityInput) {
    searchBtn.addEventListener("click", () => {
      getWeather(cityInput.value.trim());
    });

    cityInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        getWeather(cityInput.value.trim());
      }
    });
  }

  // 접속 시 현재 위치 자동 실행
  loadCurrentLocationWeather();
});
