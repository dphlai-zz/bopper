class Platform < ApplicationRecord
  belongs_to :map, :optional => true
end
