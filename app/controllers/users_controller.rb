class UsersController < ApplicationController
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
    redirect_to edit_user_path
  end # edit

  def update
  end # update

  private

  def user_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation)
  end #user_params

end
