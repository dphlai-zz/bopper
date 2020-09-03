class PlatformsController < ApplicationController
  skip_before_action :verify_authenticity_token
  def create
    platforms = params[:platforms]
    active_rec_platforms = []
    puts "PLATFORM POST DATA: #{platforms}"
   
    platforms.each do |p|
      puts "LOOP PLATFORM DATA: #{p}"
      Platform.create(
        width: p[i.to_s]["width"].to_f,
        height: p[i.to_s]["height"].to_f,
        x: p[i.to_s]["x"].to_f,
        y: p[i.to_s]["y"].to_f
      )
    end

    puts "ACTIVE RECORD PLATS #{active_rec_platforms}"
    users_map = Map.create(title: "#{@current_user.name}")
    #users_map.platforms + active_rec_platforms
    users_map.save

    render :json => {
      response: "Platform data stored for this user!"
    }
  end

  def show
  end
end
