class PagesController < ApplicationController
  before_action :check_if_logged_in
  
  def home
    @highscore = @current_user.scores.pluck(:highscore).compact.max;
    unless @highscore.present? 
      @highscore = 0
    end
  end
end
