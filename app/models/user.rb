class User < ApplicationRecord
  has_many :maps
  has_many :scores

  has_secure_password

  validates :name, length: { minimum: 2, too_short: 'not long enough!'}
  validates :email, presence: true, uniqueness: true
end
