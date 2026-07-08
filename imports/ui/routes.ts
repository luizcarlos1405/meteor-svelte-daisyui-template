import type { RouteDefinition } from 'svelte-spa-router';
import Login from './pages/Login.svelte';
import Signup from './pages/Signup.svelte';
import Home from './pages/Home.svelte';

export const routes: RouteDefinition = {
  '/login': Login,
  '/signup': Signup,
  '/': Home,
};
