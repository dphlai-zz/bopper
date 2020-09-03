class ScoresController < ApplicationController
  skip_before_action :verify_authenticity_token
  def create
    scores = params[:score]
    score_list = []
    score_list << scores
    
    score = Score.create highscore: score_list.max

    @current_user.scores << score
  end

  def show
  end

  def index
  end
end
