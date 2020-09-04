class PlatformsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
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

    users_map.save

    render :json => {
      response: "Platform data stored for this user!"
    }
  end # create

  def show
  end # show
end
