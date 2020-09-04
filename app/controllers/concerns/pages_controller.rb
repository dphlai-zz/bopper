class PagesController < ApplicationController
  def home
    @highscore = @current_user.scores.pluck(:highscore).compact.max;
    unless @highscore.present? 
      @highscore = 0
    end
  end
end
