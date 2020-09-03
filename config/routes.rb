Rails.application.routes.draw do

  get 'scores/create'
  get 'scores/show'
  get 'scores/index'
  root to: 'pages#home'

  get '/login' => 'session#new'

  post '/login' => 'session#create'

  delete '/login' => 'session#destroy'

  #post '/highscores' => ""

  resources :users

  resources :maps

end
