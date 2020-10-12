puts "Creating users..."
User.destroy_all

u1 = User.create! name: 'Danny', email: 'danny@ga.co', password: 'chicken'
test_user = User.create! name: 'test yuser', email: 'test_user@test.com', password: 'chicken'
u2 = User.create! name: 'Ben', email: 'ben@ga.co', password: 'chicken'

puts "Created #{User.count} user(s)."
