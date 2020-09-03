Rails.application.routes.draw do
  root to: 'pages#home'

  get '/login' => 'session#new'

  post '/login' => 'session#create'

  delete '/login' => 'session#destroy'

  get '/mapdata' => 'maps#get_map'

  resources :users
  resources :scores
  resources :platforms
end
