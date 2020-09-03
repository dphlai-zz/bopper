Rails.application.routes.draw do

  root to: 'pages#home'

  get '/login' => 'session#new'

  post '/login' => 'session#create'

  delete '/login' => 'session#destroy'

  #post '/highscores' => ""

  resources :users

  resources :maps

end
