Rails.application.routes.draw do
  get 'platforms/create'
  get 'platforms/show'
  root to: 'pages#home'

  get '/login' => 'session#new'

  post '/login' => 'session#create'

  delete '/login' => 'session#destroy'

  #post '/highscores' => ""

  resources :users
  resources :scores
  resources :maps
  resources :platforms
end
