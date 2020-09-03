class AddTwoColumnsToPlatforms < ActiveRecord::Migration[5.2]
  def change
    add_column :platforms, :width, :float
    add_column :platforms, :height, :float
  end
end
