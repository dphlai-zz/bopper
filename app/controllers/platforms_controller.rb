class PlatformsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :check_if_logged_in
  def create
    users_map = Map.where :user_id => @current_user.id
    if users_map.present?
      users_map.destroy_all
    else
      users_map = Map.create(title: "#{@current_user.name}", user_id: @current_user.id)
      active_rec_platforms = []
      platforms = JSON.parse(params[:platforms])
      platforms.each do |p|
        active_rec_platforms << Platform.create(
          width: p["width"].to_f,
          height: p["height"].to_f,
          x: p["x"].to_f,
          y: p["y"].to_f,
          map_id: users_map.id
        )
      end
      puts "USER PLATFORMS: #{users_map.platforms.to_a}"
      users_map.save

      render :json => {
        response: "Platform data stored for this user!"
      }
    end

  end

  def show
  end # show
end
