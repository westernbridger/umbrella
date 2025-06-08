import React, { useState, useEffect } from 'react';
import { WeatherData } from '../types';
import { SunIcon, MoonIcon, CloudIcon, CloudRainIcon, CloudSnowIcon, SunriseIcon, SunsetIcon } from './icons';

const WeatherDateTimeWidget: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000 * 60); // Update time every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // --- Mock Geolocation and Weather Fetch ---
    const mockFetchWeather = (lat?: number, lon?: number) => {
      console.log('Mock fetching weather for:', lat, lon);
      // Simulate API call delay
      setTimeout(() => {
        const now = new Date();
        const hour = now.getHours();
        const isDay = hour > 6 && hour < 20; // Simple day/night
        
        // Mock conditions based on time or random
        let tempCondition: string;
        let tempIconCode: string;
        const randomFactor = Math.random();

        if (randomFactor < 0.6) { // Sunny/Clear
            tempCondition = isDay ? "Sunny" : "Clear";
            tempIconCode = isDay ? "01d" : "01n";
        } else if (randomFactor < 0.85) { // Cloudy
            tempCondition = "Cloudy";
            tempIconCode = "02d"; // Generic cloudy
        } else if (randomFactor < 0.95) { // Rain
            tempCondition = "Light Rain";
            tempIconCode = "10d";
        } else { // Snow
            tempCondition = "Snow Showers";
            tempIconCode = "13d";
        }

        setWeatherData({
          temperature: Math.floor(15 + Math.random() * 10), // Random temp between 15-25C
          condition: tempCondition,
          iconCode: tempIconCode,
          locationName: lat && lon ? "Current Location" : "ZaphCity",
          isDay: isDay,
          sunrise: new Date(now.setHours(6,0,0,0)).getTime(), // Mock sunrise
          sunset: new Date(now.setHours(20,0,0,0)).getTime(), // Mock sunset
        });
      }, 500);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          mockFetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
          mockFetchWeather(); // Fetch with default location if geolocation fails
          setWeatherData(prev => ({...(prev || {} as WeatherData), error: "Could not get location. Showing default weather."}));
        }
      );
    } else {
      console.warn("Geolocation not supported by this browser.");
      mockFetchWeather(); // Fetch with default location
      setWeatherData(prev => ({...(prev || {} as WeatherData), error: "Geolocation not supported. Showing default weather."}));
    }
  }, []);


  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const getWeatherIcon = (iconCode: string, isDay: boolean) => {
    const sizeClass = "w-16 h-16 text-yellow-300"; // Default sun color
    const nightColorClass = "text-slate-300";
    const cloudColorClass = "text-slate-400";
    const rainSnowColorClass = "text-blue-300";


    if (iconCode.includes("01")) return isDay ? <SunIcon className={sizeClass} /> : <MoonIcon className={`${sizeClass} ${nightColorClass}`} />;
    if (iconCode.includes("02") || iconCode.includes("03") || iconCode.includes("04")) return <CloudIcon className={`${sizeClass} ${cloudColorClass}`} />;
    if (iconCode.includes("09") || iconCode.includes("10")) return <CloudRainIcon className={`${sizeClass} ${rainSnowColorClass}`} />;
    if (iconCode.includes("13")) return <CloudSnowIcon className={`${sizeClass} ${rainSnowColorClass}`} />;
    
    return isDay ? <SunIcon className={sizeClass} /> : <MoonIcon className={`${sizeClass} ${nightColorClass}`} />; // Fallback
  };

  return (
    <div className="p-1 rounded-lg mt-3">
      <div className="flex justify-between items-center text-slate-200">
        <div>
          <p className="text-xl font-semibold">{formatTime(currentDateTime)}</p>
          <p className="text-sm text-slate-400">{formatDate(currentDateTime)}</p>
        </div>
        {weatherData && !weatherData.error && (
          <div className="flex items-center text-right">
            <div className="mr-3">
              <p className="text-2xl font-bold">{weatherData.temperature}°C</p>
              <p className="text-xs text-slate-400">{weatherData.condition}</p>
              <p className="text-xs text-slate-500">{weatherData.locationName}</p>
            </div>
            {getWeatherIcon(weatherData.iconCode, weatherData.isDay)}
          </div>
        )}
      </div>
      {weatherData?.error && <p className="text-xs text-red-400 mt-2 text-center">{weatherData.error}</p>}
      {/* Optional: Sunrise/Sunset times */}
      {/* {weatherData && weatherData.sunrise && weatherData.sunset && (
        <div className="flex justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-700/50">
          <div className="flex items-center"><SunriseIcon className="w-4 h-4 mr-1"/> {new Date(weatherData.sunrise).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
          <div className="flex items-center"><SunsetIcon className="w-4 h-4 mr-1"/> {new Date(weatherData.sunset).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
        </div>
      )} */}
    </div>
  );
};

export default WeatherDateTimeWidget;