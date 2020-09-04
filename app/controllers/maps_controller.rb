class MapsController < ApplicationController
  def get_map

    map = Map.find_by user: @current_user.id

    if map.present?
      render :json => {
        platforms: map.platforms.to_a
      }
    else
      render :json => {
        response: "No maps for this user"
      }
    end

  end # get_map
end
