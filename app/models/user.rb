class User < ApplicationRecord
  has_many :maps
  has_many :scores
end
