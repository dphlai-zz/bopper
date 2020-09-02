Rails.application.routes.draw do

  mount ActionCable.server => '/cable'

  root to: 'pages#home'

  get '/login' => 'session#new'

  post '/login' => 'session#create'

  delete '/login' => 'session#destroy'

  resources :users

  resources :maps

end
