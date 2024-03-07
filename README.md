# React Native Weather App 🌞

### This is a simple, cross-platform React Native app to demonstrate some of my overall WebDev, AppDev, React, TypeScript, and API knowledge

### This app uses:

* [React Native](https://reactnative.dev/)
    * [Expo](https://expo.dev/)
    * [Axios](https://axios-http.com/)
    * [dotenv](https://www.npmjs.com/package/dotenv)
* [TypeScript](https://www.typescriptlang.org/)
* Free [OpenWeatherMap API](https://openweathermap.org/api)

<hr  />


### Setup
Feel free to clone or fork the repo

**Some prerequisite:**
* Node.js (npm comes pre-bundled with Node)
* npm / Yarn `npm install --g yarn`
* expo-cli: `npm install -g expo-cli`

After cloning the repo, just navigate to the root directory, and depending on your setup run either: 
`npm install` or `yarn install`

**Start the Expo app development**
Test and start developing the app by navigating to the root directory, and running: 
`npx expo start` 
<i>Hint. Use the `-c` flag if you want to start the app without cache</i>

<hr>
  
### OpenWeatherMap API

If you want to use the OpenWeatherMap API, then you need to head over to their website, sign up and get yourself an API key. They've got a free one that works great for starting off or testing. After you have an account and API key:

* Create an `.env` file in the root directory
* Make sure that the `.env` file is inside your `.gitignore`!
* Paste your API key inside the `.env` file, and name it something cool 😎
* For example: `WEATHER_API_KEY=1337`

<hr>