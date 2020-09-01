class UsersController < ApplicationController

  before_action :check_if_logged_in, only:[:edit, :update]

  def new
    @user = User.new
  end # new

  def create
    @user = User.create user_params

    if @user.persisted?
      session[:user_id] = @user.id
      redirect_to root_path
    else
      render :new
    end
  end # create

  def edit
    @user = @current_user
  end # edit

  def update

    @current_user.update user_params
    redirect_to root_path
  end # update

  private

  def user_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation)
  end #user_params

end
