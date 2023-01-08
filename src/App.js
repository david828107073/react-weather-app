// import './App.css';
import styled from "@emotion/styled";
import {ReactComponent as DayCloudyIcon} from './images/day-cloudy.svg';
import {ReactComponent as AirFlowIcon} from './images/airFlow.svg';
import {ReactComponent as RainIcon} from './images/rain.svg';
import {ReactComponent as RefreshIcon} from './images/refresh.svg';
import {ReactComponent as LoadingIcon} from './images/loading.svg';
import {ThemeProvider} from '@emotion/react';
import React, {useState, useEffect, useCallback} from 'react';
import dayjs from 'dayjs';
// build styled components


const Container = styled.div`
  background-color: ${({theme}) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeatherCard = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: ${({theme}) => theme.boxShadow};
  background-color: ${({theme}) => theme.foregroundColor};
  box-sizing: border-box;
  padding: 30px 15px;
`;

const Location = styled.div`
  font-size: 28px;
  color: ${({theme}) => theme.titleColor};
  margin-bottom: 20px;
`;

const Description = styled.div`
  font-size: 16px;
  color: ${({theme}) => theme.textColor};
  margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Temperature = styled.div`
  color: ${({theme}) => theme.temperatureColor};
  font-size: 96px;
  font-weight: 300;
  display: flex;
`;

const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`;

const AirFlow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 300;
  color: ${({theme}) => theme.textColor}`;

const Rain = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 300;
  color: ${({theme}) => theme.textColor};

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const DayCloudy = styled(DayCloudyIcon)`
  flex-basis: 30%;
`;

const Refresh = styled.div`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 12px;
  display: inline-flex;
  align-items: flex-end;
  color: ${({theme}) => theme.textColor};

  svg {
    margin-left: 10px;
    width: 15px;
    height: 15px;
    cursor: pointer;
    animation: rotate 1.5s linear;
    animation-duration: ${({isLoading}) => isLoading ? '1.5s' : '0s'};
  }

  @keyframes rotate {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }

`;

const theme = {
    light: {
        backgroundColor: '#ededed',
        foregroundColor: '#f9f9f9',
        boxShadow: '0 1px 3px 0 #999999',
        titleColor: '#212121',
        temperatureColor: '#757575',
        textColor: '#828282',
    },
    dark: {
        backgroundColor: '#1F2022',
        foregroundColor: '#121416',
        boxShadow:
            '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
        titleColor: '#f9f9fa',
        temperatureColor: '#dddddd',
        textColor: '#cccccc',
    },
};

const AUTHORIZATION_KEY = 'CWB-D9A270FF-7E1C-4734-9CF8-B63DF1C5B473';
const LOCATION_NAME = '臺北';
const LOCATION_NAME_FORECAST = '臺北市';

const fetchCurrentWeather = () => {
    return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${AUTHORIZATION_KEY}&locationName=${LOCATION_NAME}`)
        .then((response) => response.json())
        .then((data) => {
            const locationData = data.records.location[0];
            const weatherElements = locationData.weatherElement.reduce(
                (neededElements, item) => {
                    if (['WDSD', 'TEMP'].includes(item.elementName)) {
                        neededElements[item.elementName] = item.elementValue;
                    }
                    return neededElements;
                },
                {}
            );


            return {
                observationTime: locationData.time.obsTime,
                locationName: locationData.locationName,
                temperature: weatherElements.TEMP,
                windSpeed: weatherElements.WDSD
            }
        });
}


const fetchWeatherForecast = () => {
    return fetch(
        `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${AUTHORIZATION_KEY}&locationName=${LOCATION_NAME_FORECAST}`
    )
        .then((response) => response.json())
        .then((data) => {
            const locationData = data.records.location[0];
            const weatherElements = locationData.weatherElement.reduce(
                (neededElements, item) => {
                    if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
                        neededElements[item.elementName] = item.time[0].parameter;
                    }
                    return neededElements;
                },
                {}
            );

            return {
                description: weatherElements.Wx.parameterName,
                weatherCode: weatherElements.Wx.parameterValue,
                rainPossibility: weatherElements.PoP.parameterName,
                comfortability: weatherElements.CI.parameterName
            }

        });
};


const App = () => {
    // console.dir('invoke function component');
    const [currentTheme, setCurrentTheme] = useState('dark');


    const [weatherElement, setWeatherElement] = useState({
        observationTime: new Date(),
        locationName: '',
        temperature: 0,
        windSpeed: 0,
        description: '',
        weatherCode: 0,
        rainPossibility: 0,
        comfortability: '',
        isLoading: true,
    });

    const fetchData = useCallback(async () => {
        setWeatherElement((prevState) => ({
            ...prevState,
            isLoading: true,
        }));
        const [currentWeather, weatherForecast] = await Promise.all([fetchCurrentWeather(), fetchWeatherForecast()]);
        setWeatherElement({
            ...currentWeather,
            ...weatherForecast,
            isLoading: false
        })
    },[]);


    useEffect(() => {
        // console.dir('execute function in useEffect...');
        // fetchCurrentWeather();
        // fetchWeatherForecast();


        fetchData();

    }, [fetchData]);

    const {
        observationTime,
        locationName,
        description,
        windSpeed,
        temperature,
        rainPossibility,
        isLoading,
        comfortability,
    } = weatherElement;

    return (
        <ThemeProvider theme={theme[currentTheme]}>
            <Container>
                <WeatherCard>
                    <Location>{locationName}</Location>
                    <Description>{description} {comfortability}</Description>
                    <CurrentWeather>
                        <Temperature>
                            {Math.round(temperature)}<Celsius>°C</Celsius>
                        </Temperature>
                        <DayCloudy/>
                    </CurrentWeather>
                    <AirFlow>
                        <AirFlowIcon/>{windSpeed} m/h
                    </AirFlow>
                    <Rain>
                        <RainIcon/>{rainPossibility}%
                    </Rain>
                    <Refresh onClick={fetchData} isLoading={isLoading}>最後觀測時間:
                        {new Intl.DateTimeFormat('zh-TW', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                        }).format(dayjs(observationTime))}{' '}
                        {isLoading ? <LoadingIcon/> : <RefreshIcon/>}
                    </Refresh>
                </WeatherCard>
            </Container>
        </ThemeProvider>
    );
}

export default App;
