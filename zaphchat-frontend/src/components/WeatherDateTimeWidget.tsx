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
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!apiKey) return;

    const cacheKey = 'weatherDataCache';
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 15 * 60 * 1000) {
          setWeatherData(parsed.data);
          return;
        }
      } catch {/* ignore corrupted cache */}
    }

    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        if (!res.ok) throw new Error('Failed request');
        const data = await res.json();
        const formatted: WeatherData = {
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].description,
          iconCode: data.weather[0].icon,
          locationName: data.name,
          isDay: data.weather[0].icon.includes('d'),
          sunrise: data.sys.sunrise * 1000,
          sunset: data.sys.sunset * 1000,
        };
        setWeatherData(formatted);
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: formatted }));
      } catch (err) {
        console.warn('Weather fetch failed', err);
        setWeatherData(prev => ({ ...(prev || {} as WeatherData), error: 'Unable to retrieve weather.' }));
      }
    };

    const fallback = () => fetchWeather(45.5, -73.4);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fallback()
      );
    } else {
      fallback();
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
