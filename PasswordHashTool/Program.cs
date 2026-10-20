using System;

string hash = BCrypt.Net.BCrypt.HashPassword("admin123");
Console.WriteLine($"HASH_FOR_ADMIN123: {hash}");
