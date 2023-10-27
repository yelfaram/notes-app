# Scrimba - Notes App
This is my solution to the [Notes App project on Scrimba](https://scrimba.com/learn/learnreact)

## Features
The following features were added: 
- Syncing notes with local storage
    - Later updated to using Cloud Firestore as the db
- Adding note summary titles
- Moving modified notes to the top of the list
- Deleting notes

Was able to understand the following from the implemented features:
- localStorage
- lazy state initialization
- onSnapshot, setDoc, addDoc, deleteDoc, doc
- debouncing db writes

## React + Vite
This project was created with [Vite](https://vitejs.dev/guide/)

Due to conflicting dependencies with React 18 and ReactMde, include --legacy-peer-deps flag when doing npm install.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
